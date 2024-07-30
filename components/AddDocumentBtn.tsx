"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { createDocument } from "@/lib/actions/room.actions";
import { useRouter } from "next/navigation";

const AddDocumentBtn = ({ userId, email }: AddDocumentBtnProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const addDocumenthandler = async () => {
    setLoading(true);
    try {
      const room = await createDocument({ userId, email });
      console.log(room);
      if (room) {
        router.push(`/documents/${room.id}`);
      }
    } catch (e) {
      console.log(`Error adding a new document ${e}`);
    }
    setLoading(false);
  };

  return (
    <Button
      type="submit"
      onClick={addDocumenthandler}
      className="gradient-blue flex gap-1 shadow-lg w-40"
    >
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-r-white border-t-white border-b-white rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center">
          <Image src="assets/icons/add.svg" alt="Add" height={20} width={20}/>
          <p className="hidden sm:block">New document</p>
        </div>
      )}
    </Button>
  );
};

export default AddDocumentBtn;
