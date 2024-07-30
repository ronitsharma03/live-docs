import { useIsThreadActive } from "@liveblocks/react-lexical";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useThreads } from "@liveblocks/react/suspense";
import React from "react";


const ThreadWrapper = ({thread}: ThreadWrapperProps) => {
    const isThreadActive = useIsThreadActive(thread.id);

    return (
        <Thread thread={thread} data-state={isThreadActive ? "active" : null}/>
    )
}
const Comments = () => {
    const { threads } = useThreads();
    return (
        <div className="comments-container">
            <Composer className="comments-composer"/>
            {
                threads.map((thread) => (
                    <ThreadWrapper key={thread.id} thread={thread}/>
                ))
            }
        </div>
    )
}

export default Comments;
