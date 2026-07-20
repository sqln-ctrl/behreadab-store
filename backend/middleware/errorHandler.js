const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  if (err.code === '23505') return res.status(400).json({ message: 'Record already exists' });
  if (err.code === '23503') return res.status(400).json({ message: 'Referenced record not found' });
  res.status(status).json({ message: err.message || 'Server error' });
};
export default errorHandler;
