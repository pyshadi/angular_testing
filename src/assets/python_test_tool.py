import os
import shutil
import subprocess
import tempfile
import uuid

def list_angular_files(path):
    angular_files = []
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith((".component.ts", ".service.ts")):
                angular_files.append(os.path.join(root, file))
    return angular_files

def select_files(files):
    print("Select Angular components/services to test:")
    for i, file in enumerate(files):
        print(f"{i + 1}: {file}")
    selection = input("Enter the numbers of the files to test (comma-separated): ")
    selected_indices = [int(x) - 1 for x in selection.split(",")]
    return [files[i] for i in selected_indices]

def main():
    project_path = input("Enter the path to your Angular project: ")
    angular_files = list_angular_files(project_path)
    selected_files = select_files(angular_files)
    return project_path, selected_files

def generate_angular_project():
    temp_dir = tempfile.mkdtemp()
    os.chdir(temp_dir)
    npx_path = 'npx'  # or 'C:\\Program Files\\nodejs\\npx.cmd' if npx is not in PATH
    command = [npx_path, '@angular/cli', 'new', 'test-project', '--minimal']
    result = subprocess.run(command, check=True, shell=True, capture_output=True)
    print(result.stdout.decode())
    print(result.stderr.decode())

    unique_id = str(uuid.uuid4())
    destination = os.path.join(temp_dir, f'test-project-{unique_id}')
    shutil.move(os.path.join(temp_dir, 'test-project'), destination)
    return destination

def fix_file_structure(test_project_path):
    app_path = os.path.join(test_project_path, 'src', 'app')
    nested_app_path = os.path.join(app_path, 'src', 'app')

    if os.path.exists(nested_app_path):
        for item in os.listdir(nested_app_path):
            shutil.move(os.path.join(nested_app_path, item), app_path)
        shutil.rmtree(os.path.join(app_path, 'src'))

def copy_selected_files(project_path, selected_files, test_project_path):
    app_path = os.path.join(test_project_path, 'src', 'app')
    for file in selected_files:
        relative_path = os.path.relpath(file, project_path)
        destination = os.path.join(app_path, os.path.basename(file))
        shutil.copy(file, destination)

def install_dependencies(test_project_path):
    subprocess.run(['npm', 'install'], cwd=test_project_path, check=True, shell=True)
    subprocess.run(['npm', 'install', '--save-dev', '@types/jasmine'], cwd=test_project_path, check=True, shell=True)

def setup_tests(selected_files, test_project_path):
    app_path = os.path.join(test_project_path, 'src', 'app')
    for file in selected_files:
        file_name = os.path.basename(file)
        if "component" in file_name:
            test_file_content = f"""
import {{ ComponentFixture, TestBed }} from '@angular/core/testing';
import {{ {file_name.split('.')[0]} }} from './{file_name.split('.')[0]}';

describe('{file_name.split('.')[0]}', () => {{
  let component: {file_name.split('.')[0]};
  let fixture: ComponentFixture<{file_name.split('.')[0]}>;

  beforeEach(async () => {{
    await TestBed.configureTestingModule({{
      declarations: [ {file_name.split('.')[0]} ]
    }})
    .compileComponents();
  }});

  beforeEach(() => {{
    fixture = TestBed.createComponent({file_name.split('.')[0]});
    component = fixture.componentInstance;
    fixture.detectChanges();
  }});

  it('should create', () => {{
    expect(component).toBeTruthy();
  }});
}});
"""
        elif "service" in file_name:
            test_file_content = f"""
import {{ TestBed }} from '@angular/core/testing';
import {{ {file_name.split('.')[0]} }} from './{file_name.split('.')[0]}';

describe('{file_name.split('.')[0]}', () => {{
  let service: {file_name.split('.')[0]};

  beforeEach(() => {{
    TestBed.configureTestingModule({{}});
    service = TestBed.inject({file_name.split('.')[0]});
  }});

  it('should be created', () => {{
    expect(service).toBeTruthy();
  }});
}});
"""
        test_file_path = os.path.join(app_path, file_name.replace(".ts", ".spec.ts"))
        with open(test_file_path, "w") as test_file:
            test_file.write(test_file_content)

if __name__ == "__main__":
    project_path, selected_files = main()
    test_project_path = generate_angular_project()
    copy_selected_files(project_path, selected_files, test_project_path)
    fix_file_structure(test_project_path)
    install_dependencies(test_project_path)
    setup_tests(selected_files, test_project_path)
    print(f"The test project has been set up at: {test_project_path}")

    # Print current working directory to help diagnose
    print(f"Current working directory: {os.getcwd()}")
    print("Run the following command to start the tests:")
    print(f"cd {test_project_path} && ng test")
