import React, { useEffect, useMemo, useState } from "react";

const STATUS = {
    HADIR: "hadir",
    TERLAMBAT: "terlambat",
    IZIN: "izin",
    SAKIT: "sakit",
    ALFA: "alfa",
};

const statusMeta = {
    [STATUS.HADIR]: { label: "Hadir", color: "#16a34a" },
    [STATUS.TERLAMBAT]: { label: "Terlambat", color: "#f59e0b" },
    [STATUS.IZIN]: { label: "Izin", color: "#3b82f6" },
    [STATUS.SAKIT]: { label: "Sakit", color: "#8b5cf6" },
    [STATUS.ALFA]: { label: "Alfa", color: "#ef4444" },
};

const sampleClasses = ["X-A", "X-B", "XI-A", "XI-B", "XII-A"];

const mockFetchAttendance = ({ kelas, tanggal }) => {
    return new Promise((resolve) => {
        const names = [
            "Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hendra",
            "Ika", "Joko", "Kiki", "Lina", "Maya", "Nando", "Oka", "Putri",
        ];
        const students = names.map((n, i) => {
            const seed = (tanggal || "") + (kelas || "") + i;
            const code = seed.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
            const r = code % 100;
            let status = STATUS.HADIR;
            if (r < 5) status = STATUS.ALFA;
            else if (r < 12) status = STATUS.SAKIT;
            else if (r < 20) status = STATUS.IZIN;
            else if (r < 35) status = STATUS.TERLAMBAT;
            else status = STATUS.HADIR;
            const time =
                status === STATUS.HADIR
                    ? `07:${10 + (code % 40)}`.slice(0, 5)
                    : status === STATUS.TERLAMBAT
                        ? `07:${45 + (code % 10)}`
                        : "-";
            return {
                id: `${kelas || "?"}-${i + 1}`,
                nis: `00${1000 + i}`,
                name: n,
                status,
                time,
                note: status === STATUS.IZIN ? "Orangtua mengabari" : "",
            };
        });

        setTimeout(() => resolve(students), 350);
    });
};

const LihatAbsensi = () => {
    const [kelas, setKelas] = useState(sampleClasses[0]);
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kelas, tanggal]);

    function load() {
        setLoading(true);
        mockFetchAttendance({ kelas, tanggal })
            .then((data) => setAttendance(data))
            .finally(() => setLoading(false));
    }

    const counts = useMemo(() => {
        const c = {
            [STATUS.HADIR]: 0,
            [STATUS.TERLAMBAT]: 0,
            [STATUS.IZIN]: 0,
            [STATUS.SAKIT]: 0,
            [STATUS.ALFA]: 0,
        };
        attendance.forEach((s) => {
            c[s.status] = (c[s.status] || 0) + 1;
        });
        return c;
    }, [attendance]);

    const filtered = attendance.filter((s) => {
        const q = search.trim().toLowerCase();
        if (filterStatus && s.status !== filterStatus) return false;
        if (!q) return true;
        return (
            s.name.toLowerCase().includes(q) ||
            s.nis.toLowerCase().includes(q) ||
            (s.note || "").toLowerCase().includes(q)
        );
    });

    function toggleFilter(st) {
        setFilterStatus((prev) => (prev === st ? null : st));
    }

    function exportCSV() {
        const header = ["NIS", "Nama", "Status", "Waktu", "Catatan"];
        const rows = attendance.map((r) => [
            r.nis,
            r.name,
            statusMeta[r.status].label,
            r.time,
            r.note || "",
        ]);
        const csv =
            [header, ...rows]
                .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `absensi_${kelas}_${tanggal}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Lihat Absensi</h2>
            <div className="mb-4 text-gray-600">
                Daftar siswa per kelas & per hari — pilih kelas dan tanggal untuk melihat rekap.
            </div>

            <div className="flex items-center gap-3 mb-4">
                <label className="flex flex-col text-sm">
                    Kelas
                    <select
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="p-2 mt-1 border rounded"
                    >
                        {sampleClasses.map((k) => (
                            <option key={k} value={k}>
                                {k}
                            </option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
                    Tanggal
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        style={{ padding: 8, marginTop: 6 }}
                    />
                </label>

                <button onClick={load} style={{ padding: "8px 12px", marginTop: 18 }}>
                    Muat ulang
                </button>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button onClick={exportCSV} style={{ padding: "8px 12px", marginTop: 18 }}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {Object.keys(statusMeta).map((st) => (
                    <button
                        key={st}
                        onClick={() => toggleFilter(st)}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border:
                                filterStatus === st
                                    ? `2px solid ${statusMeta[st].color}`
                                    : "1px solid #ddd",
                            background: "#fff",
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        title={statusMeta[st].label}
                    >
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 6,
                                background: statusMeta[st].color,
                                display: "inline-block",
                            }}
                        />
                        <strong style={{ fontSize: 13 }}>{statusMeta[st].label}</strong>
                        <span style={{ color: "#666", fontSize: 13 }}>
                            ({counts[st] || 0})
                        </span>
                    </button>
                ))}

                <div
                    style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                    }}
                >
                    <input
                        placeholder="Cari nama atau NIS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: 8,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            minWidth: 220,
                        }}
                    />
                </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
                <div
                    style={{
                        padding: 12,
                        borderBottom: "1px solid #f3f3f3",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontSize: 14, color: "#333" }}>
                        Rekap: <strong>{kelas}</strong> — <strong>{tanggal}</strong>
                    </div>
                    <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>
                        Total siswa: <strong>{attendance.length}</strong>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
                        Memuat data...
                    </div>
                ) : attendance.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
                        Belum ada data absensi.
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
                        Tidak ada hasil untuk filter saat ini.
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead
                            style={{
                                background: "#fafafa",
                                textAlign: "left",
                                fontSize: 13,
                            }}
                        >
                            <tr>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                        width: 50,
                                    }}
                                >
                                    No
                                </th>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                        width: 140,
                                    }}
                                >
                                    NIS
                                </th>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                    }}
                                >
                                    Nama
                                </th>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                        width: 120,
                                    }}
                                >
                                    Status
                                </th>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                        width: 120,
                                    }}
                                >
                                    Waktu
                                </th>
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #f0f0f0",
                                    }}
                                >
                                    Catatan
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, idx) => (
                                <tr key={s.id} style={{ borderBottom: "1px solid #fbfbfb" }}>
                                    <td style={{ padding: "10px 12px" }}>{idx + 1}</td>
                                    <td style={{ padding: "10px 12px" }}>{s.nis}</td>
                                    <td style={{ padding: "10px 12px" }}>{s.name}</td>
                                    <td style={{ padding: "10px 12px" }}>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                gap: 8,
                                                alignItems: "center",
                                                padding: "6px 8px",
                                                borderRadius: 999,
                                                background: `${statusMeta[s.status].color}22`,
                                                color: statusMeta[s.status].color,
                                                fontWeight: 600,
                                                fontSize: 13,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 6,
                                                    background: statusMeta[s.status].color,
                                                    display: "inline-block",
                                                }}
                                            />
                                            {statusMeta[s.status].label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 12px" }}>{s.time}</td>
                                    <td style={{ padding: "10px 12px" }}>{s.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LihatAbsensi;
