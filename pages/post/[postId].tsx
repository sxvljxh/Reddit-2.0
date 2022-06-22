import { useMutation, useQuery } from "@apollo/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Avatar from "../../components/Avatar";
import Post from "../../components/Post";
import { ADD_COMMENT } from "../../graphql/mutations";
import { GET_POSTS_BY_POST_ID } from "../../graphql/query";

type FormData = {
  comment: string;
};

// children: JSX.Element|JSX.Element[];

export default function PostId() {
  const router = useRouter();

  const { data: session } = useSession();

  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [GET_POSTS_BY_POST_ID, "getPostListByPostId"],
  });

  const { data, loading } = useQuery(GET_POSTS_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const post: Post = data?.getPostListByPostId;

  const onSubmit = async (data: FormData) => {
    console.log(data);
    const notification = toast.loading("Posting Your comment...");
    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    });
    setValue("comment", "");
    toast.success("Comment posted successfully!", {
      id: notification,
    });
  };
  console.log(post);

  return (
    <div className="max-w-5xl mx-auto my-7">
      {<Post post={post} loading={loading} />}
      {post && !loading && (
        <div>
          <div className="p-5 pl-16 -mt-1 bg-white border border-t-0 border-gray-300 rounded-b-md">
            {session && (
              <p className="text-sm">
                Comment as{" "}
                <span className="text-orange-600">{session?.user?.name}</span>
              </p>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-2"
            >
              <textarea
                {...register("comment", { minLength: 1, required: true })}
                disabled={!session}
                className="h-24 p-2 pl-4 border border-gray-200 rounded-md outline-none disabled:bg-gray-50"
                placeholder={
                  session
                    ? "What are your thoughts?"
                    : "Please sign in to comment"
                }
              />
              <button
                disabled={!session}
                type="submit"
                className="p-3 font-semibold text-white bg-orange-600 rounded-full disabled:bg-gray-200"
              >
                Comment
              </button>
            </form>
          </div>
          <div className="px-10 py-5 -my-5 bg-white border border-t-0 border-gray-300 rounded-b-md">
            <>
              <hr className="py-2" />
              {post?.comments.map((comment) => (
                <div
                  className="relative flex items-center space-x-2 space-y-5"
                  key={comment.id}
                >
                  <hr className="absolute z-0 h-full border top-10 left-7" />
                  <div className="z-50">
                    <Avatar seed={comment.username} />
                  </div>

                  <div className="flex flex-col">
                    <p className="py-2 text-xs text-gray-400">
                      <span className="font-semibold text-gray-600">
                        {comment.username}
                      </span>{" "}
                      • {moment(comment.created_at).fromNow()}
                    </p>
                    <p className="">{comment.text}</p>
                  </div>
                </div>
              ))}
            </>
          </div>
        </div>
      )}
    </div>
  );
}
