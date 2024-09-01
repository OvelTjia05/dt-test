import { useRouteError, Link } from "react-router-dom";

const Error = () => {
  const error: any = useRouteError();

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-destructive-foreground">Oops!</h1>
      <p className="mt-4 text-lg">Sorry, an unexpected error has occurred.</p>
      <p className="mt-2 text-muted-foreground">
        <i>{error.statusText || error.message}</i>
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-foreground hover:bg-blue-700"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Error;
