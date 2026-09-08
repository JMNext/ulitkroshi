const badPatterns = [
  /[ху][уйxяеёиоа]/i,
  /п[иеё]зд/i,
  /бл[яя]д/i,
  /сук[аио]/i,
  /еб[ауоеёи]/i,
  /ёб[ауоеёи]/i,
  /мудак/i,
  /гандон/i,
  /prezerativ/i,
  /fuck/i,
  /bitch/i,
  /asshole/i,
  /dick/i,
  /whore/i
];

export const checkNameValidity = (text: string): "spaces" | "profane" | "ok" => {
  const trimmed = text.trim();
  
  if (trimmed.includes(" ")) return "spaces";

  return badPatterns.some(pattern => pattern.test(trimmed)) ? "profane" : "ok";
};
