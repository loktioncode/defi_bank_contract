export default function NotificationMessage({ message, error, success }) {
  if (!message) return null;

  if (error) return (
    <div className={`${error
      ? "animate__animated animate__slideInLeft  absolute top-16 right-4 flex items-center  max-w-sm w-full shadow-md rounded-lg overflow-hidden mx-auto"
      : "animate__animated animate__slideOutRight absolute top-16 right-4 flex items-center  max-w-sm w-full shadow-md rounded-lg mx-auto"
      }`}>
      <div className="p-2 bg-red-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
        <span className="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">!</span>
        <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
      </div>
    </div>
  );

  if (success) return (
    <div className={`${error
      ? "animate__animated animate__slideInLeft  absolute top-16 right-4 flex items-center  max-w-sm w-full shadow-md rounded-lg overflow-hidden mx-auto"
      : "animate__animated animate__slideOutRight absolute top-16 right-4 flex items-center  max-w-sm w-full shadow-md rounded-lg mx-auto"
      }`}>
      <div className="p-2 bg-teal-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
        <span className="flex rounded-full bg-teal-500 uppercase px-2 py-1 text-xs font-bold mr-3">!</span>
        <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
      </div>
    </div>
  );
}