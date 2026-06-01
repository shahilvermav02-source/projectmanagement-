import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants";
const userRegisterValidator = () => { return [
    body("email").trim().notEmpty().isEmail().withMessage("Email is required and should be valid"),
    body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
]};

const userLoginValidator = () => { return [
    body("email").trim().isEmail().withMessage("Email is required and should be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
]};

const userChangeCurrentPasswordValidator = () => { return [
    body("oldPassword").trim().notEmpty().withMessage("Old password is required"),
    body("newPassword").trim().isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
]};

const userForgotPasswordValidator = () => { return [
    body("email").notEmpty().trim().isEmail().withMessage("Email is required and should be valid"),
]};

const userResetForgotPasswordValidator = () => { return [
    body("newPassword").trim().isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
]};

const createProjectValidator = () =>{
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("description").optional(),
    ]
}
const addMembertoProjectValidator = () =>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
        body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(AvailableUserRoles)
        .withMessage("role is invalid"),
    ]
}
export {
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userLoginValidator,
    userRegisterValidator,
    userResetForgotPasswordValidator,
    createProjectValidator,
    addMembertoProjectValidator
};
