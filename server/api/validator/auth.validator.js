const Joi = require('joi');
Joi.objectId = Joi.string;
const helper = require('@utilities/helper');
const customJoi = require('@utilities/helper').customJoi;

const signUp = {
    payload: Joi.object().keys({
        firstName: Joi.string().trim().required().label('First Name'),
        lastName: Joi.string().trim().required().label('Last Name'),
        email: customJoi.lowercaseEmail().required().label('User Email'),
        password: Joi.string().trim().required().label('Password'),
        coPassword: Joi.string().trim().required().label('Confirm Password'),
    }).options({
        allowUnknown: true, // allow unknown is for temporary use only
    })
};

const signInGoogle = {
    payload: Joi.object().keys({
        idToken: Joi.string().required().label('id Token'),
        id: Joi.string().required().label('id'),
        firstName: Joi.string().required().label('First Name'),
        lastName: Joi.string().required().label('Last Name'),
        email: customJoi.lowercaseEmail().required().label('Email'),
        name: Joi.string().required().label('name'),
        photoUrl: Joi.any().allow('', null).label('photo url'),
        provider: Joi.string().required().label('provider'),
    })
};

const login = {
    payload: Joi.object().keys({
        email: Joi.string().trim().required().label('email'),
        password: Joi.string().trim().required().label('password'),
        check: Joi.boolean()
            .default(false)
            .allow('', null)
            .label('Remeber For 7 Days'),
    })
};

const me = {
    headers: helper.apiHeaders()
};

const getUsers = {
    headers: helper.apiHeaders(),
    query: Joi.object().keys({
        userId: Joi.string().trim().allow('', null).label('user Id'),
    })
};

const profileUpdate = {
    headers: helper.apiHeaders(),
    payload: Joi.object().keys({
        userImage: Joi.any().meta({ swaggerType: 'file' }).optional().allow('', null).label('user Image'),
        firstName: Joi.string().allow('', null).label('First Name'),
        lastName: Joi.string().allow('', null).label('Last Name'),
        email: customJoi.lowercaseEmail().allow('', null).label('Email'),
        userName: Joi.string().trim().allow('', null).label('User Name'),
        contactNo: customJoi.formattedContactNo().allow('', null).label('User Contact No.'),
        address1: Joi.string().allow('', null).label('Address line 1'),
        address2: Joi.string().allow('', null).label('Address line 2'),
        city: Joi.string().allow('', null).label('City'),
        state: Joi.string().allow('', null).label('State'),
        country: Joi.string().allow('', null).label('Country'),
        zip: customJoi.validZipCode().allow('', null).label('Zip'),
        password: Joi.string().required().label('Password'),
    })
};

const profileDelete = {
    headers: helper.apiHeaders(),
    params: Joi.object().keys({
        userId: Joi.objectId().required().label('user Id'),
    })
};

const changePass = {
    headers: helper.apiHeaders(),
    payload: Joi.object().keys({
        oldPassword: Joi.string().trim().required().label('old Password'),
        password: Joi.string().trim().required().label('Password'),
        coPassword: Joi.string().trim().required().label('confirm Password'),
    })
};

const forgotReq = {
    payload: Joi.object().keys({
        email: Joi.string().required().label('user Email'),
    })
};

const verifyOtp = {
    payload: Joi.object().keys({
        email: Joi.string().required().label('user Email'),
        otp: Joi.number().required().label('otp'),
    }),
};

const resetPassword = {
    headers: helper.apiHeaders(),
    payload: Joi.object().keys({
        password: Joi.string().required().label('password'),
        coPassword: Joi.string().required().label('confirm password'),
    }),
}

module.exports = {
    login,
    signInGoogle,
    signUp,
    me,
    getUsers,
    profileUpdate,
    profileDelete,
    changePass,
    forgotReq,
    verifyOtp,
    resetPassword
};
