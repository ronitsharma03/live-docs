"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblock";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";

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
      defaultAccesses: ["room:write"],
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
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // if (!hasAccess) {
    //   throw new Error("You don't have any access to this document");
    // }
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

    revalidatePath(`documents/${roomId}`);

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
