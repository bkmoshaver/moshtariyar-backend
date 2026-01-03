const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

exports.getClients = async (req, res, next) => {
  res.json(successResponse([], 'List of clients'));
};

exports.getClient = async (req, res, next) => {
  res.json(successResponse({}, 'Client details'));
};

exports.createClient = async (req, res, next) => {
  res.json(successResponse({}, 'Client created'));
};

exports.updateClient = async (req, res, next) => {
  res.json(successResponse({}, 'Client updated'));
};

exports.deleteClient = async (req, res, next) => {
  res.json(successResponse({}, 'Client deleted'));
};
