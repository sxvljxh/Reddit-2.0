import { useQuery } from "@apollo/client";
import { Jelly } from "@uiball/loaders";
import React, { useEffect, useState } from "react";
import { GET_ALL_POST, GET_ALL_POSTS_BY_TOPIC } from "../graphql/query";
import Post from "./Post";

type Props = {
  topic?: string;
};
export default function Feed({ topic }: Props) {
  // const { data, error } = !topic
  //   ? useQuery(GET_ALL_POST)
  //   : useQuery(GET_ALL_POSTS_BY_TOPIC, {
  //       variables: {
  //         topic,
  //       },
  //     });
  const { data, error, loading } = useQuery(
    !topic ? GET_ALL_POST : GET_ALL_POSTS_BY_TOPIC,
    {
      variables: !topic ? {} : { topic: topic },
    }
  );

  const [isLoading, setIsLoading] = useState(loading);

  const posts: Post[] = !topic ? data?.getPostList : data?.getPostListByTopic;
  console.log("loading", loading);
  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [loading]);

  return (
    <div className="max-w-5xl mx-auto mt-5 space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center w-full p-10 text-xl">
          <Jelly size={50} color={"#FF4501"} />
        </div>
      )}
      {!isLoading && !posts && (
        <p>Subreddit ini belom ada. ayo buat topik baru</p>
      )}
      {posts &&
        posts?.map((post) => (
          <Post loading={isLoading} key={post.id} post={post} />
        ))}
    </div>
  );
}
