export default function StatCard({ title, value, color }) {
  return (
    <div className={`${color} rounded-lg shadow-lg p-6 text-white`}>
      <h2 className="text-lg font-medium">{title}</h2>

      <p className="text-4xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}