export function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  }
  return (
    <div className="alert alert--error" role="alert">
      {errors.length === 1 ? (
        errors[0]
      ) : (
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
