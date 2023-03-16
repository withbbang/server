function DELETE_ALL_VISITOR(params: any = undefined) {
  const query = `DELETE FROM VISITOR`;

  return { query, params };
}

export { DELETE_ALL_VISITOR };
