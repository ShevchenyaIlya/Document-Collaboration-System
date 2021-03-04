import { send_request } from "./send_request";

class APIService {
  userLogin = async (body) => {
    return await send_request("POST", "login", body);
  };

  postComment = async (document, body) => {
    return await send_request("POST", "comment/" + document, body);
  };

  postMessage = async (body) => {
    return await send_request("POST", "message", body);
  };

  getUsers = async (document) => {
    return await send_request("GET", "users/" + document);
  };

  getMessages = async () => {
    return await send_request("GET", "messages");
  };

  changeDocumentState = async (operation, document) => {
    return await send_request("POST", operation + "/" + document);
  };

  deleteDocument = async (document) => {
    return await send_request("DELETE", "document/" + document);
  };

  getDocuments = async () => {
    return await send_request("GET", "documents");
  };

  getDocument = async (documentId) => {
    return await send_request("GET", "document/" + documentId);
  };

  updateDocument = async (documentId, body) => {
    return await send_request("PUT", "document/" + documentId, body);
  };

  postDocument = async (documentId) => {
    return await send_request("POST", "document", documentId);
  };

  getInvite = async () => {
    return await send_request("GET", "invite");
  };

  postInvite = async (body) => {
    return await send_request("POST", "invite", body);
  };

  deleteInvite = async (inviteId) => {
    return await send_request("DELETE", "invite/" + inviteId);
  };

  approveInvite = async (inviteId, body) => {
    return await send_request("POST", "invite/" + inviteId, body);
  };

  updateComment = async (commentId, body) => {
    return await send_request("PUT", "comment/" + commentId, body);
  };

  deleteComment = async (commentId) => {
    return await send_request("DELETE", "comment/" + commentId);
  };

  getComments = async (documentId) => {
    return await send_request("GET", "comments/" + documentId);
  };
}

const api = new APIService();
export { api };
