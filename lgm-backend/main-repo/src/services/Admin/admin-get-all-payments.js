import Payment from "../../models/payment-model.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";

import { validate_pagination_param } from "../../utils/validators/pagination-param-validator.js";

export const admin_get_all_payments = async (req, res, next) => {
    try {
        // const { page, limit } = req.query;

        // Validate and parse page and limit as integers
        // await validate_pagination_param.validateAsync({ page, limit });
        // const parsedPage = parseInt(page, 10);
        // const parsedLimit = parseInt(limit, 10);
        
        // Get total document count
        // const totalDocs = await Payment.countDocuments();
        
        // Calculate total pages and skip value
        // const total_pages = Math.ceil(totalDocs / parsedLimit);
        // const skip = (parsedPage - 1) * parsedLimit;
        
        // Perform the aggregation with pagination
        const allPayment = await Payment.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "users"
            }
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  {
                    _id: "$_id",
                    fullName: { $arrayElemAt: ["$users.fullName", 0] },
                    email: { $arrayElemAt: ["$users.email", 0] },
                    amount: "$amount",
                    currency: "$currency",
                    paymentMethodType: "$paymentMethodType",
                    createdAt: "$createdAt",
                    status: "$status",
                  },
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } }, 
          // { $skip: skip },
          // { $limit: parsedLimit },
          { $project: { users: 0 } }
        ]);
        
        // console.log(total_pages)
        // const payments={
        //     pays:allPayment,
        //     totalPages:total_pages,
        //     currentPage: parsedPage,
        //     totalItems: totalDocs,
        // }
          
          
        return next(
            CustomSuccess.createSuccess({
                payments:allPayment,
                // totalPages:total_pages,
                // currentPage: parsedPage,
                // totalItems: totalDocs,
            }, "Payments Get successfully sent", 200)
          );
    } catch (error) {
        logger.error(error.message);
        return next(CustomError.createError(error.message, 500));
    }
}
// socialAccessToken
// isVerified
// isDeleted
// deviceInfo
// blockedUserList
// isOccupied
// isProfileCompleted
// recommendationLimit
// location
// profileInfo