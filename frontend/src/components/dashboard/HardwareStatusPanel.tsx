export function HardwareStatusPanel() {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Hardware Status</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-gray-700">Online</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* LED Status Grid */}
        <div className="grid grid-cols-3 gap-3 pb-3 border-b border-gray-100">
          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto mb-1.5"></div>
            <div className="text-xs text-gray-500">Red LED</div>
            <div className="text-xs font-medium text-gray-700">Off</div>
          </div>

          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto mb-1.5"></div>
            <div className="text-xs text-gray-500">Yellow LED</div>
            <div className="text-xs font-medium text-gray-700">Off</div>
          </div>

          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-1.5 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>
            <div className="text-xs text-gray-500">Green LED</div>
            <div className="text-xs font-medium text-green-600">On</div>
          </div>
        </div>

        {/* Buzzer & Button */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Buzzer</div>
            <div className="text-sm font-medium text-gray-700">Silent</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Button</div>
            <div className="text-sm font-medium text-gray-700">Idle</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-400">Last sync: 2 seconds ago</div>
        </div>
      </div>
    </div>
  );
}