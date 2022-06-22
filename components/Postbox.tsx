import { LinkIcon, PhotographIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Avatar from "./Avatar";

import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import client from "../apollo-client";
import { ADD_POST, ADD_SUBREDDIT } from "../graphql/mutations";
import { GET_ALL_POST, GET_SUBREDDIT_BY_TOPIC } from "../graphql/query";

type FormData = {
  postTitle: string;
  postBody: string;
  postImage: string;
  subreddit: string;
};

type Props = {
  subreddit?: string;
};
export default function Postbox({ subreddit }: Props) {
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST, {
    // agar saat posting data, datanya akan fetching lg ke server jadi data yg di tampilkan adalah data lama + data baru
    refetchQueries: [{ query: GET_ALL_POST }],
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT);

  const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData);

    const notification = toast.loading("Creating new post...");

    //cek apakah id ini sudah terpakai apa belum, kalu sudah terpakai pakai id itu. kalo belok bikin baru
    try {
      //query for the subreddit tpoic
      const {
        data: { getSubredditListByTopic },
      } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: subreddit ? subreddit : formData.subreddit,
        },
      });

      const subredditExists = getSubredditListByTopic.length > 0;

      if (!subredditExists) {
        //create a new subreddit
        console.log(`Subreddit is New! -> Creating a new subreddit`);

        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: {
            topic: subreddit ? subreddit : formData.subreddit,
          },
        });
        console.log("Creating post...", formData);
        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: newSubreddit.id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        });

        console.log(`new post added`, newPost);
      } else {
        //use the existing subreddit
        console.log(`Subreddit exists! -> Using existing subreddit`);
        console.log(getSubredditListByTopic);

        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: getSubredditListByTopic[0].id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        });
        console.log(`new post added`, newPost);
      }

      // after the post has been added, reset the form
      setValue("postTitle", "");
      setValue("postBody", "");
      setValue("subreddit", "");
      setValue("postImage", "");
      toast.success("New Post Created!", {
        id: notification,
      });
    } catch (error: any) {
      console.error(error.message);

      toast.error(error.message, {
        id: notification,
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="sticky z-50 max-w-7xl p-2 mx-auto my-6 bg-white border border-gray-300 rounded-md top-[4.2rem]"
    >
      <div className="flex items-center space-x-3">
        {/* avatar */}
        <Avatar />
        <input
          {...register("postTitle", { required: true })}
          disabled={!session}
          className={`bg-gray-50 p-2 pl-5 outline-none rounded-md flex-1`}
          type="text"
          placeholder={`${
            session
              ? subreddit
                ? `Create a post in r/${subreddit}`
                : "Create a post by entering a title!"
              : "Sign in to post"
          }`}
        />
        <PhotographIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 text-gray-300 cursor-pointer ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
        <LinkIcon className={`h-6 text-gray-300 cursor-pointer`} />
      </div>
      {watch("postTitle") && (
        <div className="flex flex-col py-2">
          {/* body box */}
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              className="flex-1 p-2 m-2 outline-none bg-blue-50"
              {...register("postBody")}
              type="text"
              placeholder="text (optional)"
            />
          </div>

          {!subreddit && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">SubReddit:</p>
              <input
                className="flex-1 p-2 m-2 outline-none bg-blue-50"
                {...register("subreddit", { required: true })}
                type="text"
                placeholder="i.e ReactJS"
              />
            </div>
          )}

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                className="flex-1 p-2 m-2 outline-none bg-blue-50"
                {...register("postImage")}
                type="text"
                placeholder="Optional..."
              />
            </div>
          )}

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 text-red-500">
              {errors.postTitle?.type === "required" && (
                <p>A Post Title is required</p>
              )}
              {errors.subreddit?.type === "required" && (
                <p>A Subreddit is required</p>
              )}
            </div>
          )}
          {!!watch("postTitle") && (
            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-400 rounded-full hover:brightness-95"
            >
              Submit
            </button>
          )}
        </div>
      )}
    </form>
  );
}
