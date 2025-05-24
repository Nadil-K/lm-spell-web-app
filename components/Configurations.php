<link rel="stylesheet" href="components/Configurations.css">


<div class="config-panel">
	<h3>Configurations</h3>
	<form method="post" action="">

        <label for="language">Language</label>
		<select id="language" name="language" required>
			<option value="si">Sinhala</option>
			<option value="hi">Hindi</option>
			<!-- Add more languages as needed -->
		</select>

		<label for="model">Model</label>
        <select id="model" name="model" required>
			<option value="gemma">Gemma 2</option>
			<option value="llama">Llama 3.1</option>
			<!-- Add more models here -->
		</select>

		<button type="submit" name="correct">Correct</button>
	</form>
</div>
