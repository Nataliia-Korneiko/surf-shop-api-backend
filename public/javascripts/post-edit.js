const postEditForm = document.getElementById('postEditForm'); // Find post edit form

// Add submit listener to post edit form
postEditForm.addEventListener('submit', function (event) {
  const imageUploads = document.getElementById('imageUpload').files.length; // Find length of uploaded images
  const existingImgs = document.querySelectorAll('.imageDeleteCheckbox').length; // Find total number of existing images
  const imgDeletions = document.querySelectorAll(
    '.imageDeleteCheckbox:checked'
  ).length; // Find total number of potential deletions
  const newTotal = existingImgs - imgDeletions + imageUploads; // Calculate total after removal of deletions and addition of new uploads

  // If newTotal is greater than four
  if (newTotal > 4) {
    event.preventDefault(); // Prevent form from submitting
    const removalAmt = newTotal - 4; // Calculate removal amount

    alert(
      `You need to remove at least ${removalAmt} (more) image${
        removalAmt === 1 ? '' : 's'
      }!`
    ); // Alert user of their error
  }
});
