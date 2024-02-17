import { Router } from "express";
import { handle_multipart_data } from "../utils/handle-multipart-data.js";
import { user_create_account } from "../services/User/user-create-account.js";
import { user_create_preferences } from "../services/User/user-create-preferences.js";
import { user_create_profile } from "../services/User/user-create-profile.js";
import { verify_otp_key } from "../services/Auth/verify-otp.js";
import { resend_otp } from "../services/Auth/resend-otp.js";
import { check_user_auth } from "../middlewares/check-user-auth.js";
import { check_user_bearer } from "../middlewares/check-user-bearer.js";
import { check_google_auth } from "../middlewares/check-google-auth.js";
import { check_admin_bearer } from "../middlewares/check-admin-bearer.js";
import { check_admin_auth } from "../middlewares/check-admin-auth.js";
import { user_login } from "../services/Auth/user-login.js";
import { user_social_login } from "../services/Auth/user-social-login.js";
import { user_logout } from "../services/Auth/user-logout.js";
import { user_forgot_password } from "../services/Auth/user-forgot-password.js";
import { user_reset_password } from "../services/Auth/user-reset-password.js";
import { user_edit_profile } from "../services/User/user-edit-profile.js";
import { user_get_profile } from "../services/User/user-get-profile.js";
import { home_screen } from "../services/Home/home-screen.js";
import { send_match_request } from "../services/Home/send-match-request.js";
import { process_match_request } from "../services/Home/process-match-request.js";
import { get_match_request } from "../services/Home/get-match-request.js";
import { dislike_user_profile } from "../services/Home/dislike-match-request.js";
import { user_get_my_likes } from "../services/User/user-get-my-likes.js";
import { user_get_others_likes } from "../services/User/user-get-others-likes.js";
import { search_user } from "../services/User/search-user.js";
import { get_filtered_profiles } from "../services/Home/get-filtered-profiles.js";
import { user_get_others_profile } from "../services/User/user-get-others-profile.js";
import { end_conversation } from "../services/Chat/end-conversation.js";
import { user_get_tier_info } from "../services/User/user-get-tier-info.js";
import { admin_login } from "../services/Admin/admin-login.js";
import { user_make_payment } from "../services/User/user-make-payment.js";
import { user_get_my_notifications } from "../services/User/user-get-notifications.js";
import { user_seen_notification } from "../services/User/user-seen-notification.js";
import { admin_logout } from "../services/Admin/admin-logout.js";
import { admin_list_all_users } from "../services/Admin/admin-list-all-users.js";
import { admin_list_all_active_convos } from "../services/Admin/admin-list-all-active-convos.js";
import { user_create_feedback } from "../services/User/user-create-feedback.js";
import { admin_list_all_users_for_graph } from "../services/Admin/admin-list-all-users-for-graph.js";
import { admin_list_all_feedbacks } from "../services/Admin/admin-list-all-feedbacks.js";
import { admin_reply_to_feedback } from "../services/Admin/admin-reply-to-feedback.js";
import { admin_get_all_payments } from "../services/Admin/admin-get-all-payments.js";
import { user_get_questions } from "../services/User/user-get-questions.js";
import { create_questions } from "../services/User/create-question.js";
import { user_post_answer } from "../services/User/user-post-answer.js";
import { user_get_answers } from "../services/User/user-get-answers.js";
import { user_edit_answers } from "../services/User/user-edit-answers.js";

// import { delroute } from "../services/Chat/delChat.js";
const router = Router();

//------------auth handlers--------------------------------------------
router.post("/auth/verify-otp", check_user_bearer, verify_otp_key);
router.post("/auth/resend-otp", check_user_bearer, resend_otp);
router.post("/auth/login", check_user_bearer, user_login);
router.post("/auth/social-login", check_user_bearer, user_social_login);
router.post("/auth/logout", check_user_auth, user_logout);
router.post("/auth/forgot-password", check_user_bearer, user_forgot_password);
router.post("/auth/reset-password", check_user_auth, user_reset_password);
//----------------------------------------------------------------------------

//-------------user handlers---------------------------------------------------
router.post("/user/create-account", check_user_bearer, user_create_account);
router.post(
  "/user/create-profile",
  check_user_auth,
  handle_multipart_data.single("profile_picture_url"),
  user_create_profile
);
router.post(
  "/user/create-preference",
  check_user_auth,
  handle_multipart_data.array("images"),
  user_create_preferences
);
router.post(
  "/user/edit-profile",
  check_user_auth,
  handle_multipart_data.fields([
    { name: "profile_picture_url" },
    { name: "images", maxCount: 3 },
  ]),
  user_edit_profile
);
router.get("/user/get-profile", check_user_auth, user_get_profile);
router.get("/user/get-tier-info", check_user_auth, user_get_tier_info);
router.post(
  "/user/create-feedback",
  check_user_auth,
  handle_multipart_data.fields([{ name: "images", maxCount: 3 }]),
  user_create_feedback
);
//----------------------------------------------------------------------------------

//------------------------Questions-----------------------------------------------
router.get("/user/get-questions", check_user_auth, user_get_questions);
router.post("/user/create-questions", check_user_auth, create_questions);
router.post("/user/user-post-answer", check_user_auth, user_post_answer);
router.get("/user/user-get-answers", check_user_auth, user_get_answers);
router.put("/user/user-edit-answers", check_user_auth, user_edit_answers);

//------------------------Home screen-----------------------------------------------
router.get("/user/home", check_user_auth, home_screen);
router.post("/user/send-match-request", check_user_auth, send_match_request);
router.post("/user/dislike-profile", check_user_auth, dislike_user_profile);
router.post("/user/search-user", check_user_auth, search_user);
router.get("/user/get-filtered", check_user_auth, get_filtered_profiles);
//----------------------------------------------------------------------------------------------

//------------------------Notification screen---------------------------------------------------
router.get(
  "/user/get-my-notifications",
  check_user_auth,
  user_get_my_notifications
);
router.patch(
  "/user/seen-notification",
  check_user_auth,
  user_seen_notification
);
//---------------------------------------------------------------------------------------------

//----------------match requests screen-----------------------------------------------
router.post(
  "/user/process-match-request",
  check_user_auth,
  process_match_request
);
router.get("/user/get-match-request", check_user_auth, get_match_request);
//----------------------------------------------------------------------------------------------------

//----------------------likes screen-----------------------------------------------------------
router.get("/user/get-my-likes", check_user_auth, user_get_my_likes);
router.get("/user/get-others-likes", check_user_auth, user_get_others_likes);
//---------------------------------------------------------------------------------------------

//----------------------------Chat Screen-------------------------------------------------------------

router.get(
  "/user/get-others-profile",
  check_user_auth,
  user_get_others_profile
);
router.post("/user/end-conversation", check_user_auth, end_conversation);
//----------------------------------------------------------------------------------------------------

//-------------------------------Admin-----------------------------------------------------------------
router.post("/admin/login", check_admin_bearer, admin_login);
router.post("/admin/logout", check_admin_auth, admin_logout);
router.get("/admin/list-all-users", check_admin_auth, admin_list_all_users);
router.get(
  "/admin/list-all-active-convos",
  check_admin_auth,
  admin_list_all_active_convos
);
router.get(
  "/admin/list-all-users-for-graph",
  check_admin_auth,
  admin_list_all_users_for_graph
);
router.get(
  "/admin/list-all-feedbacks",
  check_admin_auth,
  admin_list_all_feedbacks
);
router.post(
  "/admin/reply-to-feedback",
  check_admin_auth,
  admin_reply_to_feedback
);
router.get("/admin/get-all-payments", check_admin_auth, admin_get_all_payments);
//----------------------------------------------------------------------------------------------------

//----------------------------Payments------------------------------------------------------------
router.post("/user/make-payment", check_user_auth, user_make_payment);
//-------------------------------------------------------------------------------------------
// router.get("/user/getget", check_user_auth,delroute)

export default router;
