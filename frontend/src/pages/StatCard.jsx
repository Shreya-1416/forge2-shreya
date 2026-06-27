export default function StatCard({ title, value, color }) {
    return (
        <div className={`${color} text-white rounded-xl shadow-lg p-6`}>
            <h2 className="text-lg">{title}</h2>

            <p className="text-4xl font-bold mt-3">
                {value}
            </p>
        </div>
    );
}