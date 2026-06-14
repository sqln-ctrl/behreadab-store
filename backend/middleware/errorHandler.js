const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;

  if (err.code === '23505') {
    return res.status(400).json({ message: 'Record already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
