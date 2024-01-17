import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.error.js';
import { User } from '../modles/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.response.js';

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

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar File is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(400, 'Avtar file is required');
  }

  const user = User.create({
    fullName,
    avatar: avatar.url,
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

export { registerUser };
