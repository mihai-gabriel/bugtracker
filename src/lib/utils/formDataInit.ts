export function loadFormDataFromObject<T extends object>(data: T) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}
