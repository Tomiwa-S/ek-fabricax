export default function removeEmptyFields(obj) {
    if (typeof obj !== 'object' || obj === null) return;
  
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
  
 
      if (Array.isArray(val)) {
     
        val.forEach(item => removeEmptyFields(item));
  
        if (val.length === 0) {
          delete obj[key];
        }
  
      } else if (val && typeof val === 'object') {
        removeEmptyFields(val);
        if (Object.keys(val).length === 0) {
          delete obj[key];
        }
  
      } else if (val === '') {
        delete obj[key];
      }
    });
  }
  