function commentEdit (commentData, authData) {
  const retval = {
    comment: commentData.comment,
    geometry: commentData.geometry,
    capabilities: commentData.capabilities,
    isApprover: authData.isApprover,
    allowDelete: authData.isApprover || commentData.comment.createdBy === authData.profile.email,
    features: commentData.features,
    id: commentData.id,
    type: commentData.type,
    selectedRadio: commentData.selectedRadio,
    riskType: commentData.riskType,
    textCommentRadio: commentData.textCommentRadio
  }
  return retval
}

module.exports = commentEdit
