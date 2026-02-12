import { Book } from 'lucide-react';

const HelpChat = () => {
    const handleOpenGuide = () => {
        // Buka guidebook di tab baru - akses langsung dari folder public
        window.open('/guidebook.html', '_blank');
    };

    return (
        <button
            onClick={handleOpenGuide}
            className="fixed bottom-6 right-6 bg-[#003366] text-white p-4 rounded-full shadow-lg hover:bg-[#002244] transition-all duration-300 z-50 flex items-center justify-center group"
            aria-label="Panduan Penggunaan"
        >
            <Book className="w-6 h-6" />
            <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap shadow-md">
                Lihat Panduan Penggunaan
            </span>
        </button>
    );
};

export default HelpChat;
