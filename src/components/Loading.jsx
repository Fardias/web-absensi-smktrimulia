const Loading = ({ size = 'large', text = 'Memuat...' }) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-[#003366] mx-auto ${sizeClasses[size]}`}></div>
                {text && (
                    <p className="mt-4 text-gray-600">{text}</p>
                )}
            </div>
        </div>
    );
};

export default Loading;
