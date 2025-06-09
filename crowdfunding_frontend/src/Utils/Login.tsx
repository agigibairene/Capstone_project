import logo from '../assets/logo.png';


export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-Outfit">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center text-2xl font-bold text-teal-800">
            <img src={logo} alt="" />
            Agriconnect
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">Login</h2>

        {/* Form */}
        <form className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-limeTxt outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-limeTxt outline-none"
            />
            <div className="text-right mt-1">
              <a href="#" className="text-sm text-lime-600 hover:underline">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-900 text-white font-semibold py-2 rounded-md hover:bg-bgColor transition cursor-pointer"
          >
            Login
          </button>

          {/* <div className="flex items-center justify-center my-2">
            <span className="text-sm text-gray-500">or</span>
          </div>

          <button
            type="button"
            className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button> */}
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-600">
          Do not have an account? <a href="#" className="text-teal-700 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
