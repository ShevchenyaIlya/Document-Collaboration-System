import { send_request } from "./send_request";

class APIService {
  userLogin = async (body) => {
    return await send_request("POST", "login", body);
  };

  postComment = async (document, body) => {
    return await send_request(
      "POST",
      "documents/" + document + "/comments",
      body
    );
  };

  postMessage = async (body) => {
    return await send_request("POST", "messages", body);
  };

  getUsers = async (document) => {
    return await send_request(
      "GET",
      "documents/" + document + "/collaborators"
    );
  };

  getMessages = async () => {
    return await send_request("GET", "messages");
  };

  changeDocumentState = async (operation, document) => {
    return await send_request(
      "PUT",
      "documents/" + document,
      JSON.stringify({ operation: operation })
    );
  };

  deleteDocument = async (document) => {
    return await send_request("DELETE", "documents/" + document);
  };

  getDocuments = async () => {
    return await send_request("GET", "documents");
  };

  getDocument = async (documentId) => {
    return await send_request("GET", "documents/" + documentId);
  };

  updateDocument = async (documentId, body) => {
    return await send_request("PUT", "documents/" + documentId, body);
  };

  postDocument = async (documentId) => {
    return await send_request("POST", "documents", documentId);
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

  updateComment = async (documentId, commentId, body) => {
    return await send_request(
      "PUT",
      "documents/" + documentId + "/comments/" + commentId,
      body
    );
  };

  deleteComment = async (documentId, commentId) => {
    return await send_request(
      "DELETE",
      "documents/" + documentId + "/comments/" + commentId
    );
  };

  getComments = async (documentId) => {
    return await send_request("GET", "documents/" + documentId + "/comments");
  };
}

export default new APIService();
