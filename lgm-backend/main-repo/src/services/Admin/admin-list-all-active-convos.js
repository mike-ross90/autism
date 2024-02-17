import Conversation from "../../models/conversation-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_pagination_param } from "../../utils/validators/pagination-param-validator.js";
import { validate_conversation_status } from "../../utils/validators/admin-validator.js";

export const admin_list_all_active_convos = async (req, res, next) => {
  try {
    const { status } = req.query;

    // await validate_pagination_param.validateAsync({ page, limit });
    // await validate_conversation_status.validateAsync({ status });

    if (status == "active") {
      // const total_active_convo_count = await Conversation.countDocuments({
      //   isEnded: false,
      // });

      // const total_pages = Math.ceil(total_active_convo_count / limit);
      // const skip = (page - 1) * limit;

//       const active_convos = await Conversation.aggregate([
//   {
//     $match: {
//       isEnded: false
//     }
//   },
//   {
//     $lookup: {
//       from: "users",                   
//       localField: "sender",
//       foreignField: "_id",
//       as: "sender"
//     }
//   },
//   {
//     $lookup: {
//       from: "users", 
//       localField: "receiver",
//       foreignField: "_id",
//       as: "reciever"
//     }
//   },
//   {
//     $unwind: "$sender"
//   },
//   {
//     $unwind: "$reciever"
//   },
//   {
//     $project: {
//       _id: 1,
//       senderFullName: "$sender.fullName",
//       senderEmail: "$sender.email",
//       receiverFullName: "$receiver.fullName",
//       receiverEmail: "$receiver.email",
//       isEnded: 1
//     }
//   }
// ]);
      const active_convos = await Conversation.aggregate([
        // {
        //   $match: {
        //     isEnded: false
        //   }
        // }, 
        {
          $lookup: {
            from: 'users', 
            localField: 'sender', 
            foreignField: '_id', 
            as: 'sender'
          }
        }, {
          $lookup: {
            from: 'users', 
            localField: 'reciever', 
            foreignField: '_id', 
            as: 'receiver'
          }
        }, {
          $unwind: {
            path: '$sender', 
            preserveNullAndEmptyArrays: true
          }
        }, {
          $unwind: {
            path: '$receiver', 
            preserveNullAndEmptyArrays: true
          }
        }, {
          $project: {
            _id: 1, 
            senderFullName: '$sender.fullName', 
            senderEmail: '$sender.email', 
            receiverFullName: '$receiver.fullName', 
            receiverEmail: '$receiver.email', 
            isEnded: 1
          }
        }
      ]);

if (active_convos.length === 0) {
  return next(
    CustomSuccess.createSuccess(
      active_convos,
      "No active conversations found",
      200
    )
  );
}


      return next(
        CustomSuccess.createSuccess(
          {
            conversations: active_convos,
            // totalPages: total_pages,
            // currentPage: parseInt(page),
            // totalItems: total_active_convo_count,
          },
          "All active conversations fetched successfully",
          200
        )
      );
    } else {
      // const total_ended_convo_count = await Conversation.countDocuments({
      //   isEnded: true,
      // });

      // const total_pages = Math.ceil(total_ended_convo_count / limit);
      // const skip = (page - 1) * limit;

      const ended_convos = await Conversation.find({ isEnded: true })
        .populate({
          path: "sender",
          select: "fullName email -_id",
        })
        .populate({
          path: "reciever",
          select: "fullName email -_id",
        })
        .select("isEnded")
        // .skip(skip)
        // .limit(limit);

      if (ended_convos.length === 0) {
        return next(
          CustomSuccess.createSuccess(
            ended_convos,
            "No ended conversations found",
            200
          )
        );
      }

      return next(
        CustomSuccess.createSuccess(
          {
            conversations: ended_convos,
            // totalPages: total_pages,
            // currentPage: parseInt(page),
            // totalItems: total_ended_convo_count,
          },
          "All ended conversations fetched successfully",
          200
        )
      );
    }
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
