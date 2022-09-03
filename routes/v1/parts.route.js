const express = require('express');
const partsController = require('../../controllers/parts.controllers');

const router = express.Router();
/* router.get('/', (req, res) => {
    res.send('parts found');
});

router.post('', (req, res) => {
    res.send('parts added');
}); */

router
    .route('/')
    /**
     * @api {get} /parts All parts
     * @apiDescription Get all the parts
     * @apiPermission admin
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {Number{1-}}         [page=1]     List page
     * @apiParam  {Number{1-100}}      [limit=10]  Users per page
     *
     * @apiSuccess {Object[]} all the parts.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
     */
    .get(partsController.getAllParts)
    /**
     * @api {post} /tools save a tool
     * @apiDescription Get all the tools
     * @apiPermission admin
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {Number{1-}}         [page=1]     List page
     * @apiParam  {Number{1-100}}      [limit=10]  Users per page
     *
     * @apiSuccess {Object[]} all the tools.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
     */
    .post(partsController.postAParts);
module.exports = router;
