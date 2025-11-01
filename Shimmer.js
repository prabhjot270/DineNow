const Shimmer = () => (
  <div className="shimmer-container">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="shimmer-card">
         <div className="shimmer-image"></div>
          <div className="shimmer-line"></div>
          <div className="shimmer-line short"></div>
      </div>
    ))}
  </div>
);
export default Shimmer;