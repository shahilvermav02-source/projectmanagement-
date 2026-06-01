import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import { inc } from "server";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); 
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email",
      ),
    );
});

const  login = asyncHandler(async(req,res)=>{
    const { email, password, username } = req.body;
    if (!username && !email) {
      throw new ApiError(400, "Username or email is required for login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "User does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

      if(!isPasswordValid){
        throw new ApiError(400,"Invalid credentials")
      }
     const { accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

    const options ={
      httpOnly: true,// to prevent client-side scripts from accessing the cookies
      secure: true
    }
    
      return res.status(200)
         .cookie("accessToken", accessToken,options)
         .cookie("refreshToken", refreshToken,options)
         .json(
          new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully",
          )
        );
});

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
       $set:{
         refreshToken:"",

       },
      },
       {
        new:true,
       }
   )
   const options ={
    httpOnly:true,
    secure: true
   }
   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
   .json(
    new ApiResponse(
      200,
      null,
      "User logged out successfully"
    )
   )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
      return res
      .status(200)
      .json(new ApiResponse(200,req.user,"Current user fetched successfully"));
})

 const verifyEmail = asyncHandler(async(req,res)=>{
   const {verificationToken}= req.params;
    
   if(!verificationToken){
    throw new ApiError(400,"Verification token is missing");
    
  let hashedToken = crypto.
         createHash("sha256")
         .update(verificationToken)
          .digest("hex");
   }
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: {$gt: Date.now()},
    })
   if(!user){
    throw new ApiError(400,"Invalid or expired verification token");
   }
   user.emailVerificationToken = undefined;
   user.emailVerificationExpiry = undefined;
   user.isEmailVerified = true;
   await user.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200,{
      isEmailVerified: true
    },"Email verified successfully"));
  })
const resendEmailVerificaiton = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user._id);
  if(!user){
    throw new ApiError(404,"User not found");
  }
  if(user.isEmailVerified){
    throw new ApiError(400,"Email is already verified");
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });
  return res.status(200).json(new ApiResponse(200,null,"Verification email resent successfully"));
})
 const refreshAccessToken = asyncHandler(async(req,res)=>{
  const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
   if(!incomingRefreshToken()){
    throw new ApiError(401,"Refresh token is missing");
   }
    try{
      const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      const user = await User.findById(decodedToken._id);
      if(!user){
        throw new ApiError(401,"Unauthorized request");
      }
    
    if(incomingTefreshTOken !== user?.refreshToken){
      throw new ApiError(401,"Invalid refresh token");
      } 
      const options ={
        httpOnly: true,
        secure: true
      }
    
   const { accessToken, refreshToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
   user.refreshToken = newRefreshToken;
    await user.save({validateBeforeSave: false});
    return res.status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed successfully",
      )
    );
 } catch(error){ 
  throw new ApiError(401,error?.message || "Invalid refresh token");
 }
  })
const forgotPasswordRequest = asyncHandler(async(req,res)=>{
  const { email } = req.body;
  const user = await User.findOne({ email });
  if(!user){
    throw new ApiError(404,"User with this email does not exist");
  }
  const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({validateBeforeSave: false});

   await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.FRONTEND_URL}/reset-password/${unHashedToken}`,
    ),
  });
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Forgot password email sent successfully"));

})
const resetForgotPassword = asyncHandler(async(req,res)=>{
  const {resetToken}=req.params;
  const {newPassword} = req.body;

  let hashedToken = crypto
   .createHash("sha256")
   .update(resetToken)
   .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(489, "Invalid or expired reset token");
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});
 const changeCurrentPasssword = asyncHandler(async(req,res)=>{
      const {oldPassword, newPassword} = req.body;
      const user= await User.findById(req.user?._id);
      const isPasswordValid = await user.isPasswordCorrect(oldPassword);
      if(!isPasswordValid){
        throw new ApiError(400,"User not found");
      }
      user.password = newPassword;
      await user.save({validateBeforeSave: false});
      return res.status(200).json(new ApiResponse(200,{}, "Password changed successfully"));
 })
     
export {registerUser, login,logoutUser, getCurrentUser,verifyEmail,forgotPasswordRequest,resendEmailVerificaiton,refreshAccessToken};
