export default function Home() {
  return (
    <main className="p-10 space-y-8">
      <h1 className="text-4xl font-bold">Studio Bot</h1>
      <p className="text-gray-600">
        Your personal class booking assistant
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Fuze House */}
        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Fuze House</h2>
          <div className="space-y-2">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Sculpt</p>
              <p className="text-sm text-gray-500">8:00 AM • Alex</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">HIIT</p>
              <p className="text-sm text-gray-500">12:00 PM • Jamie</p>
            </div>
          </div>
        </div>

        {/* Practice Room */}
        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Practice Room</h2>
          <div className="space-y-2">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Flow</p>
              <p className="text-sm text-gray-500">9:00 AM • Taylor</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Strength</p>
              <p className="text-sm text-gray-500">6:00 PM • Jordan</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}