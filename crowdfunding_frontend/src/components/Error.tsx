import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import errorImg from "../assets/Error.json";

export default function ErrorPage() {
  const { status, statusText } = useRouteError() as {
    status: number;
    statusText: string;
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 font-Outfit px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <Player
          autoplay
          loop
          src={errorImg}
          className="h-80 w-80"
        />

        <h2 className="text-4xl font-bold text-red-600">Oops!!!</h2>
        <p className="text-lg text-gray-600">
          Page {statusText} ({status})
        </p>

        <Link to="/">
          <button className="mt-4 px-6 py-2 bg-bgColor hover:bg-teal-700 text-limeTxt cursor-pointer rounded-lg shadow-md transition">
            Go to Home
          </button>
        </Link>
      </div>
    </section>
  );
}
