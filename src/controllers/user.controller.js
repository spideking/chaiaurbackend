import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.error.js';
import { User } from '../modles/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.response.js';
import { COOKIE_OPTION } from '../constants.js';

const generateAcessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAcessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Internal Server Error');
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((requiredFields) => {
      return requiredFields?.trim === '';
    })
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, 'User with Email or username already existed');
  }

  const avatarLocalPath = req.files?.avator[0]?.path;
  const coverImageLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar File is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  console.log(avatar, coverImage);

  if (!avatar) {
    throw new ApiError(400, 'Avtar file is required');
  }

  const user = await User.create({
    fullName,
    avator: avatar.url,
    coverImage: coverImage.url || '',
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went Wrong while registring the user');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User regiistered Successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  //validate emailId aur userId
  // find user via emailId or userId,
  //generate refresh Token and Access Token,
  //set access Token & refesh Token as a secured cookie,
  //log refresh Token to the database,
  //send data and access Token,

  const { email, userName, password } = req.body;

  if (
    [email, userName, password].some((data) => {
      return data?.trim === '';
    })
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  console.log(email, userName, password);

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, 'User not found Please sign In');
  }

  const isCorrect = user.isPasswordCorrect(password);

  if (!isCorrect) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = await generateAcessTokenandRefreshToken(
    user._id
  );

  const logedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  return res
    .status(200)
    .cookie('accessToken', accessToken, COOKIE_OPTION)
    .cookie('refreshToken', refreshToken, COOKIE_OPTION)
    .json(
      new ApiResponse(200, {
        data: logedInUser,
        accessToken,
        refreshToken,
      })
    );
});



export { registerUser, loginUser };
