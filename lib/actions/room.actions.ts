"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblock";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { redirect } from "next/navigation";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = await nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };
    // console.log(metadata);

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };
    // console.log(usersAccesses)
    // console.log(roomId)
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });
    // console.log(`Room is ${room}`);
    revalidatePath("/");
    return parseStringify(room);
  } catch (e) {
    console.log(`Error happened while creating the room ${e}`);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You don't have any access to this document");
    }
    return parseStringify(room);
  } catch (e) {
    console.log(`Error happened while getting a room ${e}`);
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (e) {
    console.log(`Error happened updating the title ${e}`);
  }
};

export const getAllDocuments = async (email: string) => {
  try {
    const Allrooms = await liveblocks.getRooms({ userId: email });
    return parseStringify(Allrooms);
  } catch (e) {
    console.log(`Error happened while getting all room ${e}`);
  }
};


export const updateDocumentAccess = async ({roomId, email, userType, updatedBy}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType
    };

    const room = await liveblocks.updateRoom(roomId, {usersAccesses});
    if(room){
      // Send a notification to the user
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error updating the acccess ${error}`);
  }
}

export const removeCollaborator = async ({roomId, email} : {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if(room.metadata.email === email){
      throw new Error("You cannot remove yourself");
    }
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email] : null
      }
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error removing collaborator ${error}`);
  }
}

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
}
