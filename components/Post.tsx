/* eslint-disable @next/next/no-img-element */
import {
  ArrowUpIcon,
  BookmarkIcon,
  ChatIcon,
  DotsHorizontalIcon,
  GiftIcon,
  ShareIcon,
} from "@heroicons/react/outline";
import { ArrowDownIcon } from "@heroicons/react/solid";
import moment from "moment";
import Link from "next/link";
import Avatar from "./Avatar";

import { Jelly } from "@uiball/loaders";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_VOTES_BY_POST_ID } from "../graphql/query";
import { ADD_VOTE } from "../graphql/mutations";

type Props = {
  post: Post;
  loading: boolean;
};

export default function Post({ post, loading }: Props) {
  const [vote, setVote] = useState<boolean>();
  const { data: session } = useSession();

  const queryVote = useQuery(GET_ALL_VOTES_BY_POST_ID, {
    variables: {
      post_id: post?.id,
    },
  });

  const [addVote] = useMutation(ADD_VOTE, {
    refetchQueries: [GET_ALL_VOTES_BY_POST_ID, "getVotesByPostId"],
  });

  const upVote = async (isUpVote: boolean) => {
    if (!session) {
      toast("❗ You must be logged in to vote");
      return;
    }
    if (vote && isUpVote) return;
    if (vote === false && !isUpVote) return;

    const { data } = await addVote({
      variables: {
        post_id: post?.id,
        username: session?.user?.name,
        upvote: isUpVote,
      },
    });
    console.log("newVote", data);

    toast.success(`${isUpVote ? "👍" : "👎"} ${data.insertVote.username}`);
  };

  const displayVotes = (data: any) => {
    const votes: Vote[] = queryVote.data?.getVotesByPostId;
    const displayNumber = votes?.reduce((total, vote) => {
      return vote?.upvote ? (total += 1) : (total -= 1);
    }, 0);
    if (votes?.length === 0) return 0;
    if (displayNumber === 0) {
      return votes[0]?.upvote ? 1 : -1;
    }

    return displayNumber;
  };

  useEffect(() => {
    const votes: Vote[] = queryVote.data?.getVotesByPostId;
    // Latest vote (as we sorted by newly created first in SQL query)
    // Note: you could improve this by moving it to the original query
    const vote = votes?.find(
      (vote) => vote.username === session?.user?.name
    )?.upvote;

    setVote(vote);
  }, [queryVote.data, vote, session]);
  return (
    <>
      {loading && (
        <div className="flex items-center justify-center w-full p-10 text-xl">
          <Jelly size={50} color={"#FF4501"} />
        </div>
      )}
      {!post && !loading && (
        <div className="text-center">Postingan tidak di temukan</div>
      )}
      {post && !loading && (
        <div className="">
          {!loading && (
            <Link href={`/post/${post.id}`}>
              <div className="flex bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer">
                {/* votes */}
                <div className="flex flex-col items-center justify-start p-4 space-y-1 text-gray-400 rounded-l-md">
                  <ArrowUpIcon
                    onClick={() => upVote(true)}
                    className={`voteButtons hover:text-red-400 ${
                      vote && "text-red-400"
                    }`}
                  />
                  <p className="text-xs font-bold text-black">
                    {displayVotes(queryVote.data)}
                  </p>
                  <ArrowDownIcon
                    onClick={() => upVote(false)}
                    className={`voteButtons hover:text-blue-400 ${
                      vote === false && "text-blue-400"
                    }`}
                  />
                </div>

                {/* post */}
                <div className="p-3 pb-1">
                  {/* header */}
                  <div className="flex items-center space-x-2">
                    <Avatar seed={post.username} />
                    <p className="text-xs text-gray-400">
                      <Link href={`/subreddit/${post.subreddit[0].topic}`}>
                        <span className="font-bold text-black hover:text-blue-400 hover:underline">
                          r/{post.subreddit[0].topic}
                        </span>
                      </Link>{" "}
                      • Posted by u/
                      {post.username} {moment(post.created_at).fromNow()}
                    </p>
                  </div>
                  {/* body */}
                  <div className="py-4">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="mt-2 text-sm font-light">{post.body}</p>
                  </div>
                  {/* image */}
                  {post.image && (
                    <img className="w-full" src={post.image} alt={post.title} />
                  )}
                  {/* footer */}
                  <div className="flex space-x-4 text-gray-400">
                    <div className="postButtons">
                      <ChatIcon className="w-6 h-6" />
                      <p className="hidden sm:inline">
                        {post.comments.length} comments
                      </p>
                    </div>
                    <div className="postButtons">
                      <GiftIcon className="w-6 h-6" />
                      <p className="hidden sm:inline">Award</p>
                    </div>
                    <div className="postButtons">
                      <ShareIcon className="w-6 h-6" />
                      <p className="hidden sm:inline">Share</p>
                    </div>
                    <div className="postButtons">
                      <BookmarkIcon className="w-6 h-6" />
                      <p className="hidden sm:inline">Save</p>
                    </div>
                    <div className="postButtons">
                      <DotsHorizontalIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
