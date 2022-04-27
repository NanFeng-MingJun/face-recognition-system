const checkinHTML = `


<div class="checkin-toggle-button">
  <div></div>
</div>

<div class="checkin-container is-hide">
  <div class="checkin-background">
    <div class="checkin-modal">
      <div class="checkin-body-wrapper">
        <div class="checkin-body is-hide" id="checkin-tools">
          <h3>Yêu cầu member nhìn vào camera.<br>Sau đó bấm "Capture" để điểm danh.</h3>
          <button class="checkin-btn" id="checkin-tools-capture-btn">Capture</button>
          <button class="checkin-btn" id="checkin-tools-cancel-btn">Cancel</button>
        </div>
        
        <div class="checkin-body is-hide" id="checkin-joined">
          <h3>Bạn đã tham gia lớp học.</h3>
          <button class="checkin-btn" id="checkin-joined-cancel-btn">Cancel</button>
        </div>
        
        <div class="checkin-body" id="checkin-join-form">
          <div class="checkin-form-field">
            <label>Role:</label>
            <select id="checkin-form-role">
                <option value="member">Member</option>
                <option value="host">Host</option>
              </select>
          </div>
          <div class="checkin-form-field">
            <label>Class ID:</label>
            <input type="text" placeholder="CSC11411" id="checkin-form-class"> 
          </div>
          
          <div class="checkin-form-field">
            <label>Host Password:</label>
            <input type="password" id="checkin-form-pwd">
          </div>
          <div class="checkin-form-control">
            <button class="form-button checkin-btn" id="checkin-form-join-btn">Join</button>
            <button class="form-button checkin-btn" id="checkin-form-cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

try {
	escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
		createHTML: (to_escape) => to_escape
	})

	const checkinContainer = document.createElement("div");
	checkinContainer.innerHTML = escapeHTMLPolicy.createHTML(checkinHTML);
	document.body.appendChild(checkinContainer);
} catch(err) {
	const checkinContainer = document.createElement("div");
	checkinContainer.innerHTML = checkinHTML;
	document.body.appendChild(checkinContainer);
}
