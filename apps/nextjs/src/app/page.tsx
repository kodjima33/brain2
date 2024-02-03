import Brain2Icon from "~/icons/Brain2Icon";

export default async function HomePage() {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center text-black">
      <div className="mb-32 flex flex-col items-center">
        <Brain2Icon className="h-32" />
        <div className="mt-10 flex flex-col items-center">
          <p className="text-3xl font-bold">Brain²</p>
          <p className="text-xl">Your personalized AI journal</p>
        </div>
      </div>
    </main>
  );
}
