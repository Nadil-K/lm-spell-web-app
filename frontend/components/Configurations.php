<link rel="stylesheet" href="components/Configurations.css">

<div class="config-panel">
	<h3>Configurations</h3>
    <hr>

	<form id="config-form">

        <label for="language">Language</label>
		<select id="language" name="language" required>
			<option value="sinhala">Sinhala</option>
			<option value="hindi" disabled>Hindi</option>
			<!-- Add more languages as needed -->
		</select>

		<label for="model">Model</label>
        <select id="model" name="model" required>
			<option value="mt5">mT5</option>
			<option value="gemma-2-9b" disabled>Gemma 2</option>
			<!-- Add more models here -->
		</select>

		</br></br>
        <!-- <button type="submit">Initialize Model</button> -->

		<label class="disclaimer">
			*Due to resource constraints, only the mT5 model for Sinhala language is available.
		</label>
    </form>
</div>

<script type="module" src="components/Configurations.js"></script>