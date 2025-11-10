module.exports = function setupSocket(io){
  io.on('connection', (socket) => {
    const { role, id } = socket.handshake.query || {};
    if (role === 'staff' && id) socket.join(`staff_${id}`);
    if (role === 'student' && id) socket.join(`student_${id}`);
    if (role === 'admin') socket.join('admins');

    socket.on('disconnect', () => {
      // noop
    });
  });
};
