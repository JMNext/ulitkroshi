const badPatterns: RegExp[] = [
  /[хx][уy𝄡][йӣu𝄡яеёиоа]/i,
  /п[иеё]зд/i,
  /бл[яя]д/i,
  /сук[аио]/i,
  /еб[ауоеёи]/i,
  /ёб[ауоеёи]/i,
  /муда[кц]/i,
  /гандон/i,
  /презерватив/i,
  /prezerativ/i,
  /письк[аиуео]/i,
  /жоп[аиуео]/i,
  /анус/i,
  /джигурд[аыео]/i,
  /^(ира|ira)$/i,
  /игил|isil|isis/i,
  /аль-каид[аы]/i,
  /al-qaeda/i,
  /^(эта|eta)$/i,
  /ккк|ku-klux-klan/i,
  /fuck/i,
  /bitch/i,
  /asshole/i,
  /dick/i,
  /whore/i
];

export const checkNameValidity = (text: string): "spaces" | "profane" | "song" | "ok" => {
  const trimmed = text.trim();
  
  if (trimmed.includes(" ")) return "spaces";
  if (badPatterns.some(pattern => pattern.test(trimmed))) return "profane";

  const onlyLetters = trimmed.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, "");
  if (onlyLetters.length > 0) {
    const hasVowels = /[aeiouyаеёиоуыэюя]/i.test(onlyLetters);
    const hasConsonants = /[bcdfghjklmnpqrstvwxzбвгджзйклмнпрстфхцчшщ]/i.test(onlyLetters);
    
    if (!hasVowels || !hasConsonants) return "song";
  }

  return "ok";
};
