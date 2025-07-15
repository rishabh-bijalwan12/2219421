import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Grid, Paper } from '@mui/material';

const BACKEND_URL = 'http://localhost:5000';

const UrlShortener = () => {
  const [inputs, setInputs] = useState([
    { url: '', validity: '', shortcode: '', result: null, error: null }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...inputs];
    updated[index][field] = value;
    setInputs(updated);
  };

  const handleAdd = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { url: '', validity: '', shortcode: '', result: null, error: null }]);
    }
  };

  const handleSubmit = async (index) => {
    const { url, validity, shortcode } = inputs[index];
    console.log(url)
    // Clear previous results/errors
    handleChange(index, 'result', null);
    handleChange(index, 'error', null);

    // Validate URL
    try {
      new URL(url);
    } catch {
      return handleChange(index, 'error', 'Please enter a valid URL (e.g., https://example.com)');
    }
    
    // Validate validity is a number if provided
    if (validity && isNaN(validity)) {
      return handleChange(index, 'error', 'Validity must be a number (minutes)');
    }

    const payload = {
      url,
      ...(validity && !isNaN(validity) && { validity: parseInt(validity) }),
      ...(shortcode && { shortcode })
    };

    try {
      const res = await fetch(`${BACKEND_URL}/shorturls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const updated = [...inputs];
      updated[index].result = {
        shortlink: data.shortlink,
        expiresIn: data.expiresIn
      };
      updated[index].error = null;
      setInputs(updated);

    } catch (err) {
      handleChange(index, 'error', err.message);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      {inputs.map((input, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Long URL"
                fullWidth
                variant="outlined"
                value={input.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
                placeholder="https://example.com"
                error={!!input.error && !input.url}
                helperText={!!input.error && !input.url ? input.error : ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Validity (minutes)"
                fullWidth
                variant="outlined"
                value={input.validity}
                onChange={(e) => handleChange(index, 'validity', e.target.value)}
                type="number"
                error={!!input.error && input.validity && isNaN(input.validity)}
                helperText={!!input.error && input.validity && isNaN(input.validity) ? 'Must be a number' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Shortcode (optional)"
                fullWidth
                variant="outlined"
                value={input.shortcode}
                onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => handleSubmit(index)}
                disabled={!input.url}
                sx={{ height: '56px' }}
              >
                Shorten
              </Button>
            </Grid>

            {input.result && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body1">
                    <b>Short Link:</b>{' '}
                    <a 
                      href={input.result.shortlink} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ wordBreak: 'break-all' }}
                    >
                      {input.result.shortlink}
                    </a>
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <b>Expires At:</b>{' '}
                    {input.result.expiresIn ? 
                      new Date(input.result.expiresIn).toLocaleString() : 
                      'Never expires'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {input.error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {input.error}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}
      
      {inputs.length < 5 && (
        <Button 
          onClick={handleAdd} 
          variant="outlined"
          sx={{ mt: 2 }}
        >
          + Add Another URL
        </Button>
      )}
    </Container>
  );
};

export default UrlShortener;