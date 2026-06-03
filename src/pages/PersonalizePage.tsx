import Personalization from "../components/Personalization";

export default function PersonalizePage() {
  return (
    <div className="w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl h-[calc(100vh-4rem)] p-6 md:p-8 bg-white/95 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
      <h1 className="text-3xl font-black text-green-900 mb-4 shrink-0">Personalization</h1>
      <div className="flex-1 min-h-0">
        <Personalization />
      </div>
    </div>
  );
}
