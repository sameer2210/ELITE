
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncupdateuser } from "../../store/actions/userActions";
import { Link } from "react-router-dom";
import { getPrimaryImage } from "../../utils/projectImages";

const Carts = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.userReducer?.user);

  // Log for debugging
  useEffect(() => {
    console.log("Redux User:", user);
  }, [user]);

  const removeHandler = (index) => {
    if (!user || !user.cart || !user.cart[index]) return;

    const copyUser = { ...user, cart: [...user.cart] };
    copyUser.cart.splice(index, 1);
    dispatch(asyncupdateuser(copyUser.id, copyUser));
  };

  // Guard for empty saved list or missing project data
  const cartlist =
    user?.cart?.length > 0 ? (
      user.cart.map((item, index) => {
        if (!item?.product) return null;

        const project = item.product;
        const { title, id, category } = project;
        const image =
          getPrimaryImage(project?.image, project?.images) ||
          "https://placehold.co/120";

        return (
          <div
            key={index}
            className="items-center rounded mb-5 bg-zinc-200 flex justify-between p-2"
          >
            <img
              src={image}
              className="w-[10vmax] h-[10vmax] object-cover"
              alt={title}
            />
            <h1 className="w-1/4 truncate">{title}</h1>
            <p className="text-sm text-gray-600">
              {category?.name || category || "Uncategorized"}
            </p>
            <button
              onClick={() => removeHandler(index)}
              className="px-3 py-1 bg-red-300 rounded"
            >
              Remove
            </button>
            <Link
              to={`/projects/${id}`}
              className="text-cyan-800 underline ml-4"
            >
              View Project
            </Link>
          </div>
        );
      })
    ) : (
      <p className="text-gray-500">No saved projects yet.</p>
    );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-5">Saved Projects</h2>
      {cartlist}
    </div>
  );
};

export default Carts;
