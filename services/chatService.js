const Message = require("../models/Message");
const User = require("../models/User");

const getChatRoomsByUser = async (userId) => {
  // 로그인한 사용자의 DB ID 가져오기
  const user = await User.findOne({ userId });
  if (!user) throw new Error("User not found");

  // 사용자가 속한 채팅방 가져오기
  const chatRooms = await ChatRoom.find({ members: user._id })
    .populate("members", "name userId") // 멤버 이름, ID
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 1 }, // 마지막 메시지만 가져오기
      populate: { path: "sender", select: "name userId" }
    });

  // 각 채팅방별 필요한 정보 가공
  return chatRooms.map(room => {
    const lastMessage = room.messages[0];
    const unreadCount = lastMessage ? (lastMessage.readBy.includes(user._id) ? 0 : 1) : 0;

    return {
      roomId: room._id,
      name: room.name,
      members: room.members,
      lastMessage: lastMessage ? lastMessage.content : "",
      lastSender: lastMessage ? lastMessage.sender.name : "",
      unreadCount,
      favorite: room.favorite.includes(user._id)
    };
  });
};

module.exports = { getChatRoomsByUser };