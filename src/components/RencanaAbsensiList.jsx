import React from "react";

const RencanaAbsensiList = ({ data }) => {
  // Group data by tanggal
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.tanggal]) acc[curr.tanggal] = [];
    acc[curr.tanggal].push(curr);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <p className="text-gray-600 text-center py-10 bg-gray-50 rounded-lg shadow-inner">
        Belum ada data rencana absensi.
      </p>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "libur":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([tanggal, records]) => (
        <div
          key={tanggal}
          className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-blue-700 mb-3">
            {new Date(tanggal).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((r) => (
              <div
                key={`${r.tanggal}-${r.kelas.kelas_id}`}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium text-gray-800">
                  {r.kelas.tingkat} {r.kelas.paralel} - {r.kelas.jurusan}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold text-gray-600">Status:</span>{" "}
                  <span className={`capitalize font-semibold ${getStatusColor(r.status_hari)}`}>
                    {r.status_hari}
                  </span>
                </p>
                {r.keterangan && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    "{r.keterangan}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RencanaAbsensiList;