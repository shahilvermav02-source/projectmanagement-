import { Router } from "express";
import { registerUser, login, logoutUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator,addMemberToProjectValidator} from "../validators/index.js";
import { verifyJWT,validateProjecctPermissions } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";
import { getProjects,
    getProjectsById,
    createProjects,
    updateProjects,
    deleteProjects,
    addMemberToProject
    ,getProjectMembers,
    updateProjectMemberRole,
    deleteMember,
 } from "../controllers/project.controller.js";
import { UserRolesEnum } from "../utils/constants.js";
const router = Router();

router.use(verifyJWT)

router 
     .route("/:projectId")
     .get(getProjects)
     .post(createProjectValidator(),validate,createProjects);

router 
     .route("/:projectId")
     .get(validateProjectPermission(AvailableUserRole),getProjectById)
     .post(createProjectValidator(),validate,createProjects);//in the validate we store all the error and the we send the createProect

     router 
     .route("/:projectId")
     .get(validateProjectPermission(AvailableUserRole),getProjectById)
     .put(validateProjecctPermissions([UserRolesEnum.ADMIN]),
    createProjectValidator(),validate,updateProject)
    .delete(
        validateProjecctPermissions([UserRolesEnum.ADMIN]),
        deleteProjects,
    );
  //if u put colom : that becomes the params
    router
         .route("/:projectId/members")
         .get(getProjectMembers)
         .post(
            validateProjecctPermissions([UserRolesEnum.ADMIN]),
            addMemberToProject(),
            validate,
            addMemberToProject
         )
   
         router 
         .route("/:projectId/members/:userId")
         .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateProjectMemberRole)
         .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember);



export default router;