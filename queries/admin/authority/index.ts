function SELECT_AUTHORITY() {
  const query = `
      SELECT AUTH, DESCRIPTION FROM AUTHORITY WHERE AUTH < 30 ORDER BY AUTH DESC
    `;

  return { query };
}

export { SELECT_AUTHORITY };
